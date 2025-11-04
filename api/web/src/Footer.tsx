
import { Footer } from '@axa-fr/react-toolkit-layout-footer';
import logo from '@axa-fr/react-toolkit-core/dist/assets/logo-axa.svg';

import '@axa-fr/react-toolkit-layout-footer/dist/footer.scss';

function FooterComponent() {
  return (
    <Footer
    icon={logo}
    copyright={'AXA France'}
  />
  );
}

export default FooterComponent;
