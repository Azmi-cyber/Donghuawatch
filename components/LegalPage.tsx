import { ReactNode } from 'react';

export default function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="container-x max-w-3xl py-8">
      <article className="card-brutal p-5 sm:p-8">
        <h1 className="font-heading text-2xl font-extrabold sm:text-3xl">{title}</h1>
        <p className="mt-1 text-xs text-muted">Terakhir diperbarui: {updated}</p>
        <div className="mt-6 space-y-6 text-sm leading-relaxed [&_h2]:mb-2 [&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-extrabold [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1">
          {children}
        </div>
      </article>
    </div>
  );
}
