export const validarTiempoEstimado = (valor: string): string | null => {
    const regex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;

    if (!valor || valor.trim() === '') {
        return 'El tiempo estimado es requerido';
    }

    if (!regex.test(valor)) {
        return 'Formato inválido. Use HH:mm (ej: 01:30)';
    }

    if (valor === '00:00') {
        return 'El tiempo no puede ser 00:00';
    }

    return null;
};

export const validarHorario = (valor: string): string | null => {
    const regex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;

    if (!valor || valor.trim() === '') {
        return 'El horario es requerido';
    }

    if (!regex.test(valor)) {
        return 'Formato inválido. Use HH:mm (ej: 07:30)';
    }

    return null;
};
