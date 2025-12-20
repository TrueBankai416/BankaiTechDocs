import React from 'react';

interface BuyMeACoffeeButtonProps {
  className?: string;
}

const BuyMeACoffeeButton: React.FC<BuyMeACoffeeButtonProps> = ({ className }) => {
  return (
    <a href="https://www.buymeacoffee.com/BankaiTech" className={className}>
      <img src="https://img.buymeacoffee.com/button-api/?text=Buy me a beer&emoji=🍻&slug=BankaiTech&button_colour=ff0000&font_colour=ffffff&font_family=Cookie&outline_colour=ffffff&coffee_colour=FFDD00" />
    </a>
  );
};

export default BuyMeACoffeeButton;
