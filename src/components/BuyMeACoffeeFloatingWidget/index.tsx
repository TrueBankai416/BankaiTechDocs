import React, { useEffect } from 'react';

const BuyMeACoffeeFloatingWidget: React.FC = () => {
  useEffect(() => {
    // Remove any existing widget elements and scripts
    const existingWidget = document.querySelector('#bmc-wbtn');
    if (existingWidget) {
      existingWidget.remove();
    }
    
    const existingScript = document.querySelector('script[data-name="BMC-Widget"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Create and configure the script element
    const script = document.createElement('script');
    script.setAttribute('data-name', 'BMC-Widget');
    script.setAttribute('data-cfasync', 'false');
    script.src = `https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js?v=${Date.now()}`;
    script.setAttribute('data-id', 'BankaiTech');
    script.setAttribute('data-description', 'Support me on Buy me a coffee!');
    script.setAttribute('data-message', '');
    script.setAttribute('data-color', '#5F7FFF');
    script.setAttribute('data-position', 'Right');
    script.setAttribute('data-x_margin', '18');
    script.setAttribute('data-y_margin', '80');

    // Append the script to the document head
    document.head.appendChild(script);

    // Cleanup function to remove the script when component unmounts
    return () => {
      const existingScript = document.querySelector('script[data-name="BMC-Widget"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  // This component doesn't render anything visible itself
  // The widget is rendered by the external script
  return null;
};

export default BuyMeACoffeeFloatingWidget;
