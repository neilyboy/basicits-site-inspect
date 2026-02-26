import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Type, Circle, Save, Undo2, Loader2,
  Camera, MoveRight, Trash2
} from 'lucide-react';
import { api } from '../utils/api';

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ffffff', '#000000'];

const STAMP_ICONS = [
  { id: 'camera', label: 'CAM', color: '#3b82f6' },
  { id: 'door', label: 'DOOR', color: '#10b981' },
  { id: 'intercom', label: 'INT', color: '#8b5cf6' },
  { id: 'alarm', label: 'ALM', color: '#ef4444' },
  { id: 'sensor', label: 'SEN', color: '#f59e0b' },
  { id: 'network', label: 'NET', color: '#6366f1' },
];


const DRAG_THRESHOLD = 8;

/* ── geometry helpers ─────────────────────────────────── */

function _dist(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function _rotPt(px, py, cx, cy, a) {
  const c = Math.cos(a), s = Math.sin(a), dx = px - cx, dy = py - cy;
  return { x: cx + dx * c - dy * s, y: cy + dx * s + dy * c };
}

function _distSeg(px, py, x1, y1, x2, y2) {
  const A = px - x1, B = py - y1, C = x2 - x1, D = y2 - y1;
  const dot = A * C + B * D, lenSq = C * C + D * D;
  let t = lenSq ? dot / lenSq : -1;
  t = Math.max(0, Math.min(1, t));
  return _dist(px, py, x1 + t * C, y1 + t * D);
}

function getBounds(ann, canvas) {
  const s = ann.scale || 1;
  if (ann.type === 'text') {
    const fs = Math.max(20, canvas.width * 0.03) * s;
    return { cx: ann.x, cy: ann.y, w: ann.text.length * fs * 0.55, h: fs * 1.2 };
  }
  if (ann.type === 'stamp') {
    const sz = Math.max(30, canvas.width * 0.04) * s;
    return { cx: ann.x, cy: ann.y, w: sz * 2, h: sz };
  }
  if (ann.type === 'circle') {
    const r = ann.radius || Math.max(30, canvas.width * 0.04);
    return { cx: ann.x, cy: ann.y, w: r * 2, h: r * 2 };
  }
  if (ann.type === 'arrow') {
    const mx = (ann.x + ann.x2) / 2, my = (ann.y + ann.y2) / 2;
    return { cx: mx, cy: my, w: Math.max(Math.abs(ann.x2 - ann.x), 40), h: Math.max(Math.abs(ann.y2 - ann.y), 40) };
  }
  return { cx: ann.x, cy: ann.y, w: 60, h: 60 };
}

function hitHandle(x, y, ann, canvas, hr) {
  if (ann.type === 'arrow') {
    if (_dist(x, y, ann.x, ann.y) <= hr * 2.5) return 'arrow-start';
    if (_dist(x, y, ann.x2, ann.y2) <= hr * 2.5) return 'arrow-end';
    return null;
  }
  const b = getBounds(ann, canvas);
  const rot = ann.rotation || 0;
  const hw = b.w / 2 + 8, hh = b.h / 2 + 8;
  const br = _rotPt(b.cx + hw, b.cy + hh, b.cx, b.cy, rot);
  if (_dist(x, y, br.x, br.y) <= hr * 2.5) return 'resize';
  if (ann.type === 'text' || ann.type === 'stamp') {
    const rh = _rotPt(b.cx, b.cy - hh - hr * 4, b.cx, b.cy, rot);
    if (_dist(x, y, rh.x, rh.y) <= hr * 2.5) return 'rotate';
  }
  return null;
}

function hitBody(x, y, ann, canvas) {
  if (ann.type === 'arrow') return _distSeg(x, y, ann.x, ann.y, ann.x2, ann.y2) <= Math.max(20, (ann.thickness || 4) * 3);
  const b = getBounds(ann, canvas);
  const rot = ann.rotation || 0;
  const un = _rotPt(x, y, b.cx, b.cy, -rot);
  return Math.abs(un.x - b.cx) <= b.w / 2 + 15 && Math.abs(un.y - b.cy) <= b.h / 2 + 15;
}

/* ── drawing helpers ──────────────────────────────────── */

function drawAnnotation(ctx, ann, canvas) {
  const s = ann.scale || 1;
  const rot = ann.rotation || 0;

  if (ann.type === 'text') {
    const fs = Math.max(20, canvas.width * 0.03) * s;
    ctx.save();
    ctx.translate(ann.x, ann.y);
    ctx.rotate(rot);
    ctx.font = `bold ${fs}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = ann.color === '#ffffff' ? '#000000' : '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeText(ann.text, 0, 0);
    ctx.fillStyle = ann.color;
    ctx.fillText(ann.text, 0, 0);
    ctx.restore();
  } else if (ann.type === 'stamp') {
    const sz = Math.max(30, canvas.width * 0.04) * s;
    ctx.save();
    ctx.translate(ann.x, ann.y);
    ctx.rotate(rot);
    ctx.fillStyle = ann.stamp.color || ann.color;
    ctx.beginPath();
    ctx.roundRect(-sz, -sz / 2, sz * 2, sz, sz / 4);
    ctx.fill();
    ctx.font = `bold ${Math.max(14, canvas.width * 0.018) * s}px Arial`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ann.stamp.label, 0, 0);
    ctx.restore();
  } else if (ann.type === 'circle') {
    const r = ann.radius || Math.max(30, canvas.width * 0.04);
    ctx.strokeStyle = ann.color;
    ctx.lineWidth = ann.thickness || 4;
    ctx.beginPath();
    ctx.arc(ann.x, ann.y, r, 0, 2 * Math.PI);
    ctx.stroke();
  } else if (ann.type === 'arrow') {
    const t = ann.thickness || 4;
    ctx.strokeStyle = ann.color;
    ctx.lineWidth = t;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(ann.x, ann.y);
    ctx.lineTo(ann.x2, ann.y2);
    ctx.stroke();
    const angle = Math.atan2(ann.y2 - ann.y, ann.x2 - ann.x);
    const hl = Math.max(15, t * 3);
    ctx.beginPath();
    ctx.moveTo(ann.x2, ann.y2);
    ctx.lineTo(ann.x2 - hl * Math.cos(angle - Math.PI / 6), ann.y2 - hl * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(ann.x2, ann.y2);
    ctx.lineTo(ann.x2 - hl * Math.cos(angle + Math.PI / 6), ann.y2 - hl * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  }
}

function drawSelection(ctx, ann, canvas, hr) {
  const b = getBounds(ann, canvas);
  const rot = ann.rotation || 0;

  if (ann.type === 'arrow') {
    [{ x: ann.x, y: ann.y }, { x: ann.x2, y: ann.y2 }].forEach((pt) => {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, hr, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    });
    return;
  }

  const hw = b.w / 2 + 8, hh = b.h / 2 + 8;
  ctx.save();
  ctx.translate(b.cx, b.cy);
  ctx.rotate(rot);
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 4]);
  ctx.strokeRect(-hw, -hh, hw * 2, hh * 2);
  ctx.setLineDash([]);
  ctx.restore();

  // resize handle (bottom-right)
  const br = _rotPt(b.cx + hw, b.cy + hh, b.cx, b.cy, rot);
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(br.x, br.y, hr, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  // resize icon
  ctx.fillStyle = '#3b82f6';
  ctx.font = `bold ${hr * 1.4}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⤡', br.x, br.y);

  // rotation handle (text & stamp only)
  if (ann.type === 'text' || ann.type === 'stamp') {
    const tc = _rotPt(b.cx, b.cy - hh, b.cx, b.cy, rot);
    const rh = _rotPt(b.cx, b.cy - hh - hr * 4, b.cx, b.cy, rot);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tc.x, tc.y);
    ctx.lineTo(rh.x, rh.y);
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(rh.x, rh.y, hr, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#3b82f6';
    ctx.font = `bold ${hr * 1.4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('↻', rh.x, rh.y);
  }
}

/* ── component ────────────────────────────────────────── */

export default function PhotoAnnotate() {
  const { siteId, photoId } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tool, setTool] = useState('text');
  const [color, setColor] = useState('#ef4444');
  const [thickness, setThickness] = useState(4);
  const [annotations, setAnnotations] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [tapPosition, setTapPosition] = useState(null);
  const [selectedStamp, setSelectedStamp] = useState(STAMP_ICONS[0]);
  const [imageLoaded, setImageLoaded] = useState(false);

  const stateRef = useRef({
    mode: 'idle', active: false, dragged: false,
    dragIndex: -1, startX: 0, startY: 0,
    offsetX: 0, offsetY: 0,
    initScale: 1, initRadius: 0, initDist: 0,
    initRot: 0, cx: 0, cy: 0, initAngle: 0,
  });

  useEffect(() => { loadPhoto(); }, [photoId]);
  useEffect(() => { if (imageLoaded) redraw(); }, [annotations, imageLoaded, selectedIndex]);

  async function loadPhoto() {
    try {
      const reportData = await api.getReport(siteId);
      let foundPhoto = null;
      for (const point of reportData.points) {
        const p = point.photos.find((ph) => ph.id === photoId);
        if (p) { foundPhoto = p; break; }
      }
      if (foundPhoto) {
        setPhoto(foundPhoto);
        if (foundPhoto.annotations) {
          try { setAnnotations(JSON.parse(foundPhoto.annotations)); } catch (e) {}
        }
      }
    } catch (err) {
      console.error('Failed to load photo:', err);
    } finally {
      setLoading(false);
    }
  }

  function getCoords(cx, cy) {
    const c = canvasRef.current;
    if (!c) return { x: 0, y: 0 };
    const r = c.getBoundingClientRect();
    return { x: (cx - r.left) * (c.width / r.width), y: (cy - r.top) * (c.height / r.height) };
  }

  function handleRadius() {
    const c = canvasRef.current;
    if (!c) return 10;
    return 10 * (c.width / c.getBoundingClientRect().width);
  }

  /* ── pointer handlers ─── */
  function ptrDown(clientX, clientY) {
    if (showTextInput) return;
    const p = getCoords(clientX, clientY);
    const canvas = canvasRef.current;
    const hr = handleRadius();
    const s = stateRef.current;
    s.active = true;
    s.dragged = false;
    s.startX = p.x;
    s.startY = p.y;
    s.mode = 'idle';
    s.dragIndex = -1;

    // 1. handles on selected annotation
    if (selectedIndex >= 0 && selectedIndex < annotations.length) {
      const h = hitHandle(p.x, p.y, annotations[selectedIndex], canvas, hr);
      if (h === 'resize') {
        const ann = annotations[selectedIndex];
        const b = getBounds(ann, canvas);
        s.mode = 'resize';
        s.dragIndex = selectedIndex;
        s.initScale = ann.scale || 1;
        s.initRadius = ann.radius || Math.max(30, canvas.width * 0.04);
        s.initDist = _dist(p.x, p.y, b.cx, b.cy);
        s.cx = b.cx; s.cy = b.cy;
        return;
      }
      if (h === 'rotate') {
        const ann = annotations[selectedIndex];
        const b = getBounds(ann, canvas);
        s.mode = 'rotate';
        s.dragIndex = selectedIndex;
        s.initRot = ann.rotation || 0;
        s.cx = b.cx; s.cy = b.cy;
        s.initAngle = Math.atan2(p.y - b.cy, p.x - b.cx);
        return;
      }
      if (h === 'arrow-start' || h === 'arrow-end') {
        s.mode = h;
        s.dragIndex = selectedIndex;
        return;
      }
    }

    // 2. body hit (any annotation)
    for (let i = annotations.length - 1; i >= 0; i--) {
      if (hitBody(p.x, p.y, annotations[i], canvas)) {
        s.mode = 'move';
        s.dragIndex = i;
        s.offsetX = p.x - annotations[i].x;
        s.offsetY = p.y - annotations[i].y;
        return;
      }
    }

    // 3. empty space — arrow tool starts drawing immediately
    if (tool === 'arrow') {
      s.mode = 'draw-arrow';
      const newIdx = annotations.length;
      s.dragIndex = newIdx;
      setAnnotations(prev => [...prev, { type: 'arrow', x: p.x, y: p.y, x2: p.x, y2: p.y, color, thickness }]);
    }
  }

  function ptrMove(clientX, clientY) {
    const s = stateRef.current;
    if (!s.active) return;
    const p = getCoords(clientX, clientY);
    const d = _dist(p.x, p.y, s.startX, s.startY);
    if (d > DRAG_THRESHOLD) s.dragged = true;
    if (!s.dragged) return;

    if (s.mode === 'move' && s.dragIndex >= 0) {
      setAnnotations(prev => {
        const u = [...prev]; const a = { ...u[s.dragIndex] };
        if (a.type === 'arrow') {
          const dx = (p.x - s.offsetX) - a.x, dy = (p.y - s.offsetY) - a.y;
          a.x += dx; a.y += dy; a.x2 += dx; a.y2 += dy;
        } else { a.x = p.x - s.offsetX; a.y = p.y - s.offsetY; }
        u[s.dragIndex] = a; return u;
      });
    } else if (s.mode === 'resize' && s.dragIndex >= 0) {
      const nd = _dist(p.x, p.y, s.cx, s.cy);
      const ratio = nd / (s.initDist || 1);
      setAnnotations(prev => {
        const u = [...prev]; const a = { ...u[s.dragIndex] };
        if (a.type === 'circle') { a.radius = Math.max(15, s.initRadius * ratio); }
        else { a.scale = Math.max(0.3, Math.min(5, s.initScale * ratio)); }
        u[s.dragIndex] = a; return u;
      });
    } else if (s.mode === 'rotate' && s.dragIndex >= 0) {
      const cur = Math.atan2(p.y - s.cy, p.x - s.cx);
      setAnnotations(prev => {
        const u = [...prev];
        u[s.dragIndex] = { ...u[s.dragIndex], rotation: s.initRot + (cur - s.initAngle) };
        return u;
      });
    } else if (s.mode === 'draw-arrow' && s.dragIndex >= 0) {
      setAnnotations(prev => {
        const u = [...prev];
        if (s.dragIndex < u.length) u[s.dragIndex] = { ...u[s.dragIndex], x2: p.x, y2: p.y };
        return u;
      });
    } else if ((s.mode === 'arrow-start' || s.mode === 'arrow-end') && s.dragIndex >= 0) {
      setAnnotations(prev => {
        const u = [...prev]; const a = { ...u[s.dragIndex] };
        if (s.mode === 'arrow-start') { a.x = p.x; a.y = p.y; } else { a.x2 = p.x; a.y2 = p.y; }
        u[s.dragIndex] = a; return u;
      });
    }
  }

  function ptrUp(clientX, clientY) {
    const s = stateRef.current;
    if (!s.active) { s.active = false; return; }
    const p = getCoords(clientX, clientY);

    if (!s.dragged) {
      if (s.mode === 'move') {
        setSelectedIndex(s.dragIndex);
      } else if (s.mode === 'draw-arrow') {
        setAnnotations(prev => prev.slice(0, -1));
      } else if (s.mode === 'idle') {
        if (selectedIndex >= 0) {
          setSelectedIndex(-1);
        } else {
          if (tool === 'text') { setTapPosition(p); setShowTextInput(true); setTextInput(''); }
          else if (tool === 'stamp') {
            setAnnotations(prev => [...prev, { type: 'stamp', x: p.x, y: p.y, stamp: { ...selectedStamp }, color, scale: 1, rotation: 0 }]);
          } else if (tool === 'circle') {
            const canvas = canvasRef.current;
            setAnnotations(prev => [...prev, { type: 'circle', x: p.x, y: p.y, radius: Math.max(30, canvas.width * 0.04), color, thickness }]);
          }
        }
      }
    } else {
      if (s.mode === 'move') setSelectedIndex(s.dragIndex);
      if (s.mode === 'draw-arrow') {
        if (_dist(s.startX, s.startY, p.x, p.y) < 20) {
          setAnnotations(prev => prev.slice(0, -1));
        } else {
          setSelectedIndex(s.dragIndex);
        }
      }
    }
    s.active = false; s.mode = 'idle'; s.dragged = false; s.dragIndex = -1;
  }

  function onMD(e) { e.preventDefault(); ptrDown(e.clientX, e.clientY); }
  function onMM(e) { if (stateRef.current.active) { e.preventDefault(); ptrMove(e.clientX, e.clientY); } }
  function onMU(e) { e.preventDefault(); ptrUp(e.clientX, e.clientY); }
  function onTS(e) { e.preventDefault(); ptrDown(e.touches[0].clientX, e.touches[0].clientY); }
  function onTM(e) { e.preventDefault(); ptrMove(e.touches[0].clientX, e.touches[0].clientY); }
  function onTE(e) { e.preventDefault(); ptrUp(e.changedTouches[0].clientX, e.changedTouches[0].clientY); }

  function handleTextSubmit() {
    if (textInput.trim() && tapPosition) {
      setAnnotations(prev => [...prev, { type: 'text', x: tapPosition.x, y: tapPosition.y, text: textInput.trim(), color, scale: 1, rotation: 0 }]);
    }
    setShowTextInput(false);
    setTapPosition(null);
  }

  function redraw() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    if (!canvas || !img) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
    for (const ann of annotations) drawAnnotation(ctx, ann, canvas);
    if (selectedIndex >= 0 && selectedIndex < annotations.length) {
      drawSelection(ctx, annotations[selectedIndex], canvas, handleRadius());
    }
  }

  function handleUndo() {
    if (selectedIndex >= 0) {
      setAnnotations(prev => prev.filter((_, i) => i !== selectedIndex));
      setSelectedIndex(-1);
    } else {
      setAnnotations(prev => prev.slice(0, -1));
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = imageRef.current;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      for (const ann of annotations) drawAnnotation(ctx, ann, canvas);
      const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.9));
      const formData = new FormData();
      formData.append('annotated', blob, 'annotated.jpg');
      formData.append('annotations', JSON.stringify(annotations));
      await api.saveAnnotation(photoId, formData);
      navigate(-1);
    } catch (err) {
      alert('Failed to save: ' + err.message);
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
    </div>
  );

  if (!photo) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white gap-4">
      <p>Photo not found</p>
      <button onClick={() => navigate(-1)} className="btn-primary">Go Back</button>
    </div>
  );

  const selAnn = selectedIndex >= 0 && selectedIndex < annotations.length ? annotations[selectedIndex] : null;
  const showThick = tool === 'circle' || tool === 'arrow' || (selAnn && (selAnn.type === 'circle' || selAnn.type === 'arrow'));

  return (
    <div className="h-[100dvh] bg-black flex flex-col select-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-black/90 z-10">
        <button onClick={() => navigate(-1)} className="text-white p-2">
          <ArrowLeft size={22} />
        </button>
        <span className="text-white font-semibold text-sm">Annotate Photo</span>
        <button onClick={handleSave} disabled={saving}
          className="text-blue-400 font-semibold text-sm flex items-center gap-1 p-2">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save
        </button>
      </div>

      {/* Hint bar */}
      <div className="bg-gray-800 text-gray-400 text-center text-[11px] py-1.5 px-2">
        Tap to place • Tap element to select • Drag handles to resize/rotate
      </div>

      {/* Canvas */}
      <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden relative">
        <img ref={imageRef} src={`/uploads/${photo.filename}`} alt=""
          className="hidden" onLoad={() => setImageLoaded(true)} crossOrigin="anonymous" />
        <canvas ref={canvasRef} className="max-w-full max-h-full object-contain annotation-canvas"
          onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU}
          onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={onTE} />
      </div>

      {/* Text Input Overlay */}
      {showTextInput && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-30 p-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 w-full max-w-sm shadow-xl">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Add Text Label</p>
            <input type="text" className="input-field mb-3" placeholder="Enter label text..."
              value={textInput} onChange={e => setTextInput(e.target.value)} autoFocus
              onKeyDown={e => e.key === 'Enter' && handleTextSubmit()} />
            <div className="flex gap-2">
              <button onClick={handleTextSubmit} className="btn-primary flex-1">Add</button>
              <button onClick={() => { setShowTextInput(false); setTapPosition(null); }} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-gray-900 p-3 space-y-2.5 safe-area-pb">
        {/* Tools */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          {[
            { id: 'text', icon: Type, label: 'Text' },
            { id: 'stamp', icon: Camera, label: 'Device' },
            { id: 'circle', icon: Circle, label: 'Circle' },
            { id: 'arrow', icon: MoveRight, label: 'Arrow' },
          ].map(t => (
            <button key={t.id} onClick={() => { setTool(t.id); setSelectedIndex(-1); }}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 ${
                tool === t.id && selectedIndex < 0 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
          <button onClick={handleUndo}
            className="px-3 py-2 rounded-lg bg-gray-700 text-gray-300"
            title={selectedIndex >= 0 ? 'Delete selected' : 'Undo'}>
            {selectedIndex >= 0 ? <Trash2 size={16} /> : <Undo2 size={16} />}
          </button>
        </div>

        {/* Stamp selection */}
        {tool === 'stamp' && selectedIndex < 0 && (
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            {STAMP_ICONS.map(st => (
              <button key={st.id} onClick={() => setSelectedStamp(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${selectedStamp.id === st.id ? 'ring-2 ring-white' : 'opacity-70'}`}
                style={{ backgroundColor: st.color, color: '#fff' }}>
                {st.label}
              </button>
            ))}
          </div>
        )}

        {/* Thickness slider */}
        {showThick && (
          <div className="flex items-center gap-3 px-2">
            <span className="text-[10px] text-gray-500 uppercase font-bold shrink-0">Weight</span>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={selAnn ? (selAnn.thickness ?? 4) : thickness}
              onChange={e => {
                const v = Number(e.target.value);
                setThickness(v);
                if (selAnn && (selAnn.type === 'circle' || selAnn.type === 'arrow')) {
                  setAnnotations(prev => {
                    const u = [...prev]; u[selectedIndex] = { ...u[selectedIndex], thickness: v }; return u;
                  });
                }
              }}
              className="flex-1 accent-blue-500"
            />
            <span className="text-[11px] text-gray-400 w-6 text-right shrink-0">
              {selAnn ? (selAnn.thickness ?? 4) : thickness}
            </span>
          </div>
        )}

        {/* Colors */}
        <div className="flex items-center justify-center gap-2">
          {COLORS.map(c => (
            <button key={c} onClick={() => {
              setColor(c);
              if (selectedIndex >= 0) {
                setAnnotations(prev => { const u = [...prev]; u[selectedIndex] = { ...u[selectedIndex], color: c }; return u; });
              }
            }}
              className={`w-7 h-7 rounded-full border-2 transition-transform ${
                color === c ? 'border-white scale-125' : 'border-gray-600'
              }`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
    </div>
  );
}
