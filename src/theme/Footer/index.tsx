import React from 'react'
import Footer from '@theme-original/Footer'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
// import { MendableFloatingButton } from '@mendable/search'
import BottomBar from '@site/src/components/BottomBar'

export default function FooterWrapper(props) {
  const {
    siteConfig: { customFields },
  } = useDocusaurusContext()
  
  // Fixed TypeScript error - explicit type casting for mendableAnonKey
//  const mendableKey = customFields.mendableAnonKey as string;

  return (
    <>
      <Footer {...props} />
      <BottomBar />
    </>
  )
}
