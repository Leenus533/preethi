import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x py-24 text-center">
      <h1 className="font-display font-display-lg text-[length:var(--text-h2)] text-pine-900">That page does not exist</h1>
      <Link href="/" className="btn btn-primary mt-6">Back to home</Link>
    </div>
  );
}
