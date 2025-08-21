export default function Footer() {
  return (
    <footer className="w-full border-t border-border bg-muted py-4 mt-auto text-center text-xs text-muted-foreground">
      <span>
        Auth Service &copy; {new Date().getFullYear()} &mdash; microh-labs
      </span>
    </footer>
  );
}
