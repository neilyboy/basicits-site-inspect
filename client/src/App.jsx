import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import NewSite from './pages/NewSite';
import SiteDetail from './pages/SiteDetail';
import EditSite from './pages/EditSite';
import AddPoint from './pages/AddPoint';
import PointDetail from './pages/PointDetail';
import PhotoAnnotate from './pages/PhotoAnnotate';
import SiteReport from './pages/SiteReport';
import ArchiveManager from './pages/ArchiveManager';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/sites/new" element={<NewSite />} />
        <Route path="/sites/:siteId" element={<SiteDetail />} />
        <Route path="/sites/:siteId/edit" element={<EditSite />} />
        <Route path="/sites/:siteId/add" element={<AddPoint />} />
        <Route path="/sites/:siteId/points/:pointId" element={<PointDetail />} />
        <Route path="/archive" element={<ArchiveManager />} />
      </Route>
      <Route path="/sites/:siteId/photos/:photoId/annotate" element={<PhotoAnnotate />} />
      <Route path="/sites/:siteId/report" element={<SiteReport />} />
    </Routes>
  );
}
