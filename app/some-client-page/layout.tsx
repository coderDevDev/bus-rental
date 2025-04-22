import ClientLayout from '../client-layout';

export default function SomePageLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
