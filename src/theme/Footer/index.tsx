import React from 'react'
import Footer from '@theme-original/Footer'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import { MendableFloatingButton } from '@mendable/search'

export default function FooterWrapper(props) {
  const {
    siteConfig: { customFields },
  } = useDocusaurusContext()

  return (
    <>
      {/* Using the correct prop format expected by the MendableFloatingButton component */}
      <MendableFloatingButton 
        anon_key={customFields.mendableAnonKey as string} 
      />
      <Footer {...props} />
    </>
  )
}
