'use client';

import React from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';

interface TimePickerHMProps {
    value: string;
    onChange: (val: string) => void;
    error?: string;
    label?: string;
}

const TimePickerHM: React.FC<TimePickerHMProps> = ({ value, onChange, error, label = 'Tiempo estimado' }) => {
    const parseValue = (val: string): { hh: number; mm: number } => {
        const parts = val.split(':');
        return {
            hh: parseInt(parts[0] || '0', 10),
            mm: parseInt(parts[1] || '0', 10)
        };
    };

    const formatValue = (hh: number, mm: number): string => {
        return [hh, mm].map((v) => v.toString().padStart(2, '0')).join(':');
    };

    const { hh, mm } = parseValue(value);

    const increment = (field: 'hh' | 'mm', direction: 1 | -1) => {
        let newHh = hh,
            newMm = mm;

        if (field === 'hh') {
            newHh = (hh + direction + 24) % 24;
        } else {
            newMm = (mm + direction + 60) % 60;
        }

        onChange(formatValue(newHh, newMm));
    };

    const handleWheel = (e: React.WheelEvent, field: 'hh' | 'mm') => {
        e.preventDefault();
        const direction = e.deltaY > 0 ? 1 : -1;
        increment(field, direction);
    };

    const Spinner: React.FC<{
        value: number;
        field: 'hh' | 'mm';
        label: string;
    }> = ({ value, field, label }) => (
        <div className="flex flex-column align-items-center" style={{ minWidth: 60 }} onWheel={(e) => handleWheel(e, field)}>
            <span className="text-xs text-gray-500 mb-1">{label}</span>
            <Button icon="pi pi-chevron-up" className="p-button-rounded p-button-text p-button-sm" onClick={() => increment(field, -1)} style={{ height: 24, width: 24, minWidth: 24 }} />
            <span className="text-2xl font-bold" style={{ fontFamily: 'monospace', lineHeight: 1.2 }}>
                {value.toString().padStart(2, '0')}
            </span>
            <Button icon="pi pi-chevron-down" className="p-button-rounded p-button-text p-button-sm" onClick={() => increment(field, 1)} style={{ height: 24, width: 24, minWidth: 24 }} />
        </div>
    );

    const isZero = hh === 0 && mm === 0;

    return (
        <div>
            {label && <label className="font-medium block mb-2">{label}</label>}
            <div className="flex align-items-center gap-2">
                <Spinner value={hh} field="hh" label="HH" />
                <span className="text-2xl font-bold text-gray-500">:</span>
                <Spinner value={mm} field="mm" label="MM" />
            </div>
            <InputText value={value} className={error || isZero ? 'p-invalid mt-2' : 'mt-2'} style={{ maxWidth: 120 }} readOnly />
            {(error || isZero) && <small className="p-error block">{error || 'El tiempo no puede ser 00:00'}</small>}
        </div>
    );
};

export default TimePickerHM;
