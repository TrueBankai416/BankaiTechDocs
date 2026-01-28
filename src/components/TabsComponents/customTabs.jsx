// Example custom Tabs component in React
import React, { useState } from 'react';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

const CustomTabs = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(tabs[0].value);

  return (
    <Tabs
      defaultValue={activeTab}
      values={tabs.map((tab) => ({ label: tab.label, value: tab.value }))}
      onChange={(event, newValue) => setActiveTab(newValue)}
    >
      {tabs.map((tab) => (
        <TabItem key={tab.value} value={tab.value}>
          {activeTab === tab.value ? tab.content : null}
        </TabItem>
      ))}
    </Tabs>
  );
};

export default CustomTabs;
