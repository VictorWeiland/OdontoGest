
export function isToday(date: Date) {
    const now = new Date();

    return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate()
    )
}



/**
 * Veificar se determinado slot já passou
 */
export function isSlotInThePast(slotTime: string) {
    const [slotHour, slotMinute] = slotTime.split(":").map(Number)

    const now = new Date()
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (slotHour < currentHour) {
        return true;
    } else if (slotHour === currentHour && slotMinute <= currentMinute) {
        return true;
    }
    return false;
}

/**
 * Verificar se, a partir de um slot inicial, existe uma sequência de 'requiredSlots' disponíveis
 * Ex: se um serviço tem 2 required slots e começa no time 15:00
 * precisa garantir que 15:00 e 15:30 não esteja no nosso blockedSlots
 */
export function isSlotSequenceAvailable(
    startSlot: string, //Primeiro horario disponivel 
    requiredSlots: number, //Quantidade de slots necessários
    allSlots: string[], //odos horarios da clinica
    blockedSlots: string[] //horarios bloqueados
) {
    const startIndex = allSlots.indexOf(startSlot)
    if (startIndex === -1 || startIndex + requiredSlots > allSlots.length) {
        return false;
    }

    for (let i = startIndex; i < startIndex + requiredSlots; i++) {
        const slotTime = allSlots[i]

        if (blockedSlots.includes(slotTime)) {
            return false;
        }
    }
    return true;
}