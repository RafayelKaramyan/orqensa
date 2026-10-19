import { lazy } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { CollectionProvider } from './state/CollectionProvider';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
const Work = lazy(() => import('./pages/Work'));
const Study = lazy(() => import('./pages/Study'));
const Studio = lazy(() => import('./pages/Studio'));
const Materials = lazy(() => import('./pages/Materials'));
const Lab = lazy(() => import('./pages/Lab'));
const Collection = lazy(() => import('./pages/Collection'));
const Brief = lazy(() => import('./pages/Brief'));
const Shared = lazy(() => import('./pages/Shared'));
function Pages() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="work" element={<Work />} />
        <Route path="work/:slug" element={<Study />} />
        <Route path="studio" element={<Studio />} />
        <Route path="materials" element={<Materials />} />
        <Route path="lab" element={<Lab />} />
        <Route path="lab/:id" element={<Lab />} />
        <Route path="collection" element={<Collection />} />
        <Route path="brief" element={<Brief />} />
        <Route path="share" element={<Shared />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
export default function App() {
  return (
    <HashRouter useTransitions={false}>
      <CollectionProvider>
        <Pages />
      </CollectionProvider>
    </HashRouter>
  );
}
