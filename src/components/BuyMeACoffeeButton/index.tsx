import React from 'react';

interface BuyMeACoffeeButtonProps {
  className?: string;
}

const BuyMeACoffeeButton: React.FC<BuyMeACoffeeButtonProps> = ({ className }) => {
  return (
    <a href="https://www.buymeacoffee.com/BankaiTech" className={className}>
      <img src="/img/buymeacoffee-button.svg" alt="Buy me a beer" />
    </a>
  );
};

export default BuyMeACoffeeButton;
