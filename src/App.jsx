// import React from 'react';
// import IdeaGenerator from './IdeaGenerator';
// import Dashboard from './Dashboard';
 
// function App() {
//   return (
//     <div className="
//       w-full max-w-screen-xl mx-auto
//       px-4 py-8 md:px-6 lg:px-8
//       bg-gray-50 text-gray-900
//       min-h-screen
//     ">
//       {/* <header className="text-center mb-12">
//         <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-2">
//           AI Tweet Idea Generator
//         </h1>
//         <p className="text-lg md:text-xl text-gray-600">
//           Let our AI assistant help you craft the perfect tweet.
//         </p>
//       </header> */}
//       {/* <IdeaGenerator /> */}
//       <Dashboard/>
//     </div>
//   );
// }
 
// export default App;

import React, { useState } from 'react';
import Layout from './Layout';

import Dashboard from './Dashboard';
import AddNew from './components/AddNew';
import SuggestedNew from './components/SuggestedNew';
import Settings from './components/Settings';


const PAGES = {
  DASHBOARD: 'DASHBOARD',
  ALL_IDEAS: 'ALL IDEAS',
  ADD_NEW: 'ADD NEW',
  SUGGESTED_NEW: 'SUGGESTED NEW',
  SETTINGS: 'SETTINGS',
} ;

// type PageName = typeof PAGES[keyof typeof PAGES];

function App() {
  const [activePage, setActivePage] = useState(PAGES.DASHBOARD);

  const renderActivePage = () => {
    switch (activePage) {
      case PAGES.DASHBOARD:
        return <Dashboard />;
     
      case PAGES.ADD_NEW:
        return <AddNew />;
      case PAGES.SUGGESTED_NEW:
        return <SuggestedNew />;
      case PAGES.SETTINGS:
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activePage={activePage} setActivePage={setActivePage}>
      {renderActivePage()}
    </Layout>
  );
}

export default App;