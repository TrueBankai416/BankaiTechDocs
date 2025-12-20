import React from 'react';

interface BuyMeACoffeeButtonProps {
  className?: string;
}

const BuyMeACoffeeButton: React.FC<BuyMeACoffeeButtonProps> = ({ className }) => {
  return (
    <a href="https://www.buymeacoffee.com/BankaiTech" className={className}>
      <img src="https://img.buymeacoffee.com/button-api/?text=Buy me a beer&emoji=🍻&slug=BankaiTech&button_colour=BD5FFF&font_colour=ffffff&font_family=Lato&outline_colour=000000&coffee_colour=FFDD00" />
    </a>
  );
};

export default BuyMeACoffeeButton;
