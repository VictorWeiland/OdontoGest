import { Suspense } from 'react';
import getSession from '@/lib/getSession'
import {  redirect  } from 'next/navigation'
import { ServicesContent } from './_components/service-content';

export default async function Services(){

      const session = await getSession();
      
      if(!session?.user?.id){
        redirect("/")
      }
    
    return(
      <Suspense fallback={<div>Carregando...</div>}>
        <ServicesContent userId={session.user.id}/>
      </Suspense>
    )
}