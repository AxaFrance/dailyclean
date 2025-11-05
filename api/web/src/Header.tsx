import logo from "@axa-fr/design-system-slash-css/logo-axa.svg";
import { Header, Name } from "@axa-fr/design-system-slash-react";

const HeaderComponent = () => (
  <Header>
    <Name
      title="DailyClean"
      subtitle="Please save the planet"
      img={logo}
      alt="DailyClean"
      onClick={() => {}}
    />
  </Header>
);

export default HeaderComponent;
