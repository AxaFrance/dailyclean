import React from "react";

import Header from "./Header";
import Title from "./Title";
import Footer from "./Footer";


const App= ({children}) => <>
    <Header />
    <Title />
    {children}
    <Footer />
  </>;


export default App;
