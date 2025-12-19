import React from 'react';
import Navbar from '@theme-original/Navbar';
import type NavbarType from '@theme/Navbar';
import type {WrapperProps} from '@docusaurus/types';

type Props = WrapperProps<typeof NavbarType>;

export default function NavbarWrapper(props: Props): JSX.Element {
  return (
    <>
      <Navbar {...props} />
      <div style={{
        backgroundColor: 'var(--ifm-navbar-background-color)',
        borderBottom: '1px solid var(--ifm-toc-border-color)',
        padding: '0.5rem 1rem',
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <img src="https://img.shields.io/website?url=https%3A%2F%2Fdocs.bankai-tech.com" alt="Website" />
        <a href="https://github.com/TrueBankai416/BankaiTechDocs" target="_blank" rel="noopener noreferrer">
          <img src="https://img.shields.io/github/last-commit/TrueBankai416/BankaiTechDocs/main" alt="GitHub last commit" />
        </a>
        <a href="https://github.com/TrueBankai416/BankaiTechDocs" target="_blank" rel="noopener noreferrer">
          <img src="https://img.shields.io/github/commit-activity/t/TrueBankai416/BankaiTechDocs/main" alt="GitHub commit activity" />
        </a>
        <a href="https://github.com/TrueBankai416/BankaiTechDocs/issues" target="_blank" rel="noopener noreferrer">
          <img src="https://img.shields.io/github/issues/TrueBankai416/BankaiTechDocs" alt="GitHub Issues" />
        </a>
        <a href="https://hub.docker.com/r/bankaitech/nextcloud" target="_blank" rel="noopener noreferrer">
          <img src="https://img.shields.io/docker/pulls/bankaitech/nextcloud?label=nextcloud%20docker%20pulls" alt="Docker Pulls" />
        </a>
        <a href="https://discord.gg/6THYdvayjg" target="_blank" rel="noopener noreferrer">
          <img src="https://img.shields.io/discord/1217932881301737523?label=Discord" alt="Discord" />
        </a>
      </div>
    </>
  );
}
