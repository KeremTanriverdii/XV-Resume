export const metadata = {
  title: 'Profiles',
  description: 'Profiles Page',
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
