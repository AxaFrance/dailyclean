import { Name, Header} from '@axa-fr/react-toolkit-layout-header';
import logo from '@axa-fr/react-toolkit-core/dist/assets/logo-axa.svg';

import '@axa-fr/react-toolkit-layout-header/dist/Header/header.scss';
import '@axa-fr/react-toolkit-layout-header/dist/Infos/infos.scss';
import '@axa-fr/react-toolkit-layout-header/dist/Name/name.scss';
import '@axa-fr/react-toolkit-layout-header/dist/User/user.scss';
import '@axa-fr/react-toolkit-layout-header/dist/Logo/logo.scss';

const HeaderComponent = () => <Header>
    <Name
      title="DailyClean"
      subtitle="Please save the planet"
      img={logo}
      alt="DailyClean"
      onClick={() => {}}
    />
  </Header>;

export default HeaderComponent;
