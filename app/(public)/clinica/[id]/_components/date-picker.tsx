"use client"

import {  useState  } from 'react'
import DatePicker, {  registerLocale  } from 'react-datepicker'
import {  ptBR  } from 'date-fns/locale/pt-BR'

import "react-datepicker/dist/react-datepicker.css"

registerLocale("pt-BR",ptBR)

interface DataTimePickerProps{
    minDate?: Date;
    className?: string;
    initialDate?: Date;
    onChange: (date: Date) => void;
}

export function DateTimePicker({initialDate, className, minDate, onChange}: DataTimePickerProps){
    const [startDate, setStartDate] = useState(initialDate || new Date())

    function handleChange(date: Date | null){
        if(date){
            setStartDate(date);
            onChange(date);
        }
    }

    return(
        <DatePicker
            className={className}
            selected={startDate}
            locale="pt-BR"
            minDate={minDate ?? new Date()}
            onChange={handleChange}
            dateFormat="dd/MM/yyyy"
        />
    )
}