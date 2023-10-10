'use client';
import React, {FC} from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
type Props = {
  children: React.ReactNode;
};

const queryClient = new QueryClient();
const Provider: FC<Props> = ({children}) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default Provider;
