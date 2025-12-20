import React from 'react';
import Navbar from '@theme-original/Navbar';
import type NavbarType from '@theme/Navbar';
import type {WrapperProps} from '@docusaurus/types';

type Props = WrapperProps<typeof NavbarType>;

const navbarBadgesStyle: React.CSSProperties = {
  backgroundColor: 'var(--ifm-navbar-background-color)',
  borderBottom: '1px solid var(--ifm-toc-border-color)',
  padding: '0.5rem 1rem',
  display: 'flex',
  gap: '0.5rem',
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignItems: 'center',
};

export default function NavbarWrapper(props: Props): JSX.Element {
  return (
    <>
      <Navbar {...props} />
      <div style={navbarBadgesStyle}>
        <a href="https://docs.bankai-tech.com" target="_blank" rel="noopener noreferrer" aria-label="Visit the BankaiTech documentation website">
          <img src="https://img.shields.io/website?url=https%3A%2F%2Fdocs.bankai-tech.com" alt="Website" />
        </a>
        <a href="https://github.com/TrueBankai416/BankaiTechDocs" target="_blank" rel="noopener noreferrer" aria-label="Open the BankaiTechDocs GitHub repository (last commit)">
          <img src="https://img.shields.io/github/last-commit/TrueBankai416/BankaiTechDocs/main" alt="GitHub last commit" />
        </a>
        <a href="https://github.com/TrueBankai416/BankaiTechDocs" target="_blank" rel="noopener noreferrer" aria-label="View commit activity for the BankaiTechDocs GitHub repository">
          <img src="https://img.shields.io/github/commit-activity/t/TrueBankai416/BankaiTechDocs/main" alt="GitHub commit activity" />
        </a>
        <a href="https://github.com/TrueBankai416/BankaiTechDocs/issues" target="_blank" rel="noopener noreferrer" aria-label="View open issues for the BankaiTechDocs GitHub repository">
          <img src="https://img.shields.io/github/issues/TrueBankai416/BankaiTechDocs" alt="GitHub Issues" />
        </a>
        <a href="https://hub.docker.com/r/bankaitech/nextcloud" target="_blank" rel="noopener noreferrer" aria-label="View Nextcloud Docker image pulls for BankaiTech on Docker Hub">
          <img src="https://img.shields.io/docker/pulls/bankaitech/nextcloud?label=nextcloud%20docker%20pulls" alt="Docker Pulls" />
        </a>
        <a href="https://discord.gg/6THYdvayjg" target="_blank" rel="noopener noreferrer" aria-label="Join the BankaiTech Discord server">
          <img src="https://img.shields.io/discord/1217932881301737523?label=Discord" alt="Discord" />
        </a>
      </div>
    </>
  );
}
