import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import Overview from './pages/Projects/Overview';
import Analytics from './pages/Projects/Analytics';
import Profile from './pages/Settings/Profile';
import Security from './pages/Settings/Security';
import Help from './pages/Help/Help';
import { Symbols } from './pages/Markets/NSE/Symbols';
import { Categories } from './pages/Markets/NSE/Categories';
import { Subcategories } from './pages/Markets/NSE/Subcategories';
import CategoriesHeatmap from './pages/Views/Heatmap/Categories';
import SubcategoriesHeatmap from './pages/Views/Heatmap/Subcategories';
import { SubcategoryHeatmap } from './pages/Indicators/Heatmaps/Subcategory';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Dashboard (Root path) */}
          <Route index element={<Dashboard />} />
          
          {/* Projects submenu pages */}
          <Route path="projects">
            <Route path="overview" element={<Overview />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
          
          {/* Markets submenu pages */}
          <Route path="markets">
            <Route path="nse">
              <Route path="symbols" element={<Symbols />} />
              <Route path="categories" element={<Categories />} />
              <Route path="subcategories" element={<Subcategories />} />
            </Route>
          </Route>

          {/* Views Heatmap pages */}
          <Route path="views">
            <Route path="heatmap">
              <Route path="categories" element={<CategoriesHeatmap />} />
              <Route path="subcategories" element={<SubcategoriesHeatmap />} />
            </Route>
          </Route>

          {/* Indicators Heatmap pages */}
          <Route path="indicators">
            <Route path="heatmaps">
              <Route path="subcategory" element={<SubcategoryHeatmap />} />
            </Route>
          </Route>
          
          {/* Settings submenu pages */}
          <Route path="settings">
            <Route path="profile" element={<Profile />} />
            <Route path="security" element={<Security />} />
          </Route>
          
          {/* Help & FAQ page */}
          <Route path="help" element={<Help />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
