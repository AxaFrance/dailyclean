import Footer from "./Footer";
import Header from "./Header";
import HeaderTitle from "./Title";

const App = ({ children }) => (
  <>
    <Header />
    <HeaderTitle />
    {children}
    <Footer />
  </>
);

export default App;
