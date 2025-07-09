"use client";

import React from 'react';
import { FloatingServicesButton } from './floating-services-button';
import { ServiceListDrawer } from './service-list-drawer';

export function ServicesList() {
  return (
    <>
      <FloatingServicesButton />
      <ServiceListDrawer />
    </>
  );
}

export { useServiceList } from '@/stores/service-list';
export type { ServiceListItem } from '@/stores/service-list';
export { AddToListButton } from './add-to-list-button'; 