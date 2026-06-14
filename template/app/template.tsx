import { PageTransition } from '@/components/ui/PageTransition';

// App Router re-mounts template.tsx on every navigation → route transitions.
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
