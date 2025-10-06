'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { InputText } from 'primereact/inputtext';
import type { Demo } from '@/types';

// ⚠️ Importar IconService de forma dinámica (evita SSR)
let IconService: any = null;
if (typeof window !== 'undefined') {
  // Carga solo en el navegador
  import('../../../../demo/service/IconService').then(mod => {
    IconService = mod.IconService;
  });
}

const IconsDemo = () => {
  const [icons, setIcons] = useState<Demo.Icon[]>([]);
  const [filteredIcons, setFilteredIcons] = useState<Demo.Icon[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !IconService) return; // evita SSR

    IconService.getIcons().then((data: Demo.Icon[]) => {
      data.sort((a, b) =>
        a.properties!.name.localeCompare(b.properties!.name)
      );
      setIcons(data);
      setFilteredIcons(data);
    });
  }, []);

  const onFilter = (event: React.FormEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value?.toLowerCase() ?? '';
    if (!value) {
      setFilteredIcons(icons);
    } else {
      setFilteredIcons(
        icons.filter(
          (it) =>
            it.icon?.tags?.some((tag) => tag.toLowerCase().includes(value))
        )
      );
    }
  };

  return (
    <div className="card">
      <h2>Icons</h2>
      <p>
        PrimeReact components internally use{' '}
        <Link
          href="https://github.com/primefaces/primeicons"
          className="font-medium hover:underline text-primary"
          target="_blank"
        >
          PrimeIcons
        </Link>{' '}
        library, the official icons suite from{' '}
        <Link
          href="https://www.primetek.com.tr"
          className="font-medium hover:underline text-primary"
          target="_blank"
        >
          PrimeTek
        </Link>
        .
      </p>

      <h4>Download</h4>
      <p>PrimeIcons is available at npm:</p>
      <pre className="app-code">
        <code>{`npm install primeicons --save`}</code>
      </pre>

      <h4>Usage Example</h4>
      <pre className="app-code">
        <code>{`<i className="pi pi-check"></i>`}</code>
      </pre>

      <InputText
        type="text"
        className="w-full p-3 mt-3 mb-5"
        onInput={onFilter}
        placeholder="Search an icon"
      />

      <div className="grid icons-list text-center">
        {filteredIcons.map((iconMeta) => {
          const { icon, properties } = iconMeta;
          if (icon?.tags?.includes('deprecate')) return null;
          return (
            <div
              className="col-6 sm:col-4 lg:col-3 xl:col-2 pb-5"
              key={properties?.name}
            >
              <i className={'text-2xl mb-2 pi pi-' + properties?.name}></i>
              <div>pi-{properties?.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IconsDemo;
