import { ReactNode } from "react";
import Footer from "./Footer";
import Header from "./Header";
import HeaderTitle from "./Title";

interface AppProps {
  children: ReactNode;
}

const App = ({ children }: AppProps) => (
  <>
    <Header />
    <HeaderTitle />
    {children}
    <Footer />
  </>
);

export default App;
