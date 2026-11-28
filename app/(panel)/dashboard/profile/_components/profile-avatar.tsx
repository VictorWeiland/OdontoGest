"use client"

import Image from "next/image"
import { ChangeEvent, useState } from "react"
import semFoto from "../../../../../public/foto1.png"
import { Camera, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { updateProfileAvatar } from "../_actions/update-avatar"
import { useSession } from "next-auth/react"

interface AvatarProfileProps {
  avatarUrl: string | null
  userId: string
}

export function AvatarProfile({ avatarUrl, userId }: AvatarProfileProps) {
  const [previewImage, setPreviewImage] = useState(avatarUrl)
  const [loading, setLoading] = useState(false)
  const { update } = useSession()

  async function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setLoading(true)
      const image = e.target.files[0]

      if (image.type !== "image/jpeg" && image.type !== "image/png" && image.type !== "image/webp") {
        toast.error("Formato de imagem inválido. Use JPG, PNG ou WEBP.")
        setLoading(false)
        return
      }

      const newFileName = `${userId}`
      const newFile = new File([image], newFileName, { type: image.type })

      const urlImage = await uploadImage(newFile)

      if (!urlImage) {
        toast.error("Falha ao alterar a imagem.")
        setLoading(false)
        return
      }

      setPreviewImage(urlImage)

      await updateProfileAvatar({ avatarUrl: urlImage })
      await update({ image: urlImage })
      setLoading(false)
      toast.success("Foto atualizada com sucesso!")
    }
  }

  async function uploadImage(image: File): Promise<string | null> {
    try {
      const formData = new FormData()
      formData.append("file", image)
      formData.append("userId", userId)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL || ""}/api/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      )

      const data = await response.json()
      if (!response.ok) return null
      return data.secure_url as string
    } catch (err) {
      console.error(err)
      return null
    }
  }

  return (
    <div className="relative group flex flex-col items-center">
      <div className="relative size-32 sm:size-36 overflow-hidden rounded-full border-4 border-white ring-4 ring-emerald-500/20 shadow-md dark:border-slate-800">
        <Image
          src={previewImage || semFoto}
          alt="Foto de perfil da clínica"
          fill
          className="object-cover"
          priority
          sizes="160px"
        />

        {/* Overlay hover para trocar foto */}
        <label className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/60 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
          {loading ? (
            <Loader2 className="size-6 animate-spin" />
          ) : (
            <>
              <Camera className="size-6" />
              <span className="text-[10px] font-semibold mt-1">Alterar</span>
            </>
          )}
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="sr-only"
            disabled={loading}
            onChange={handleChange}
          />
        </label>
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Clique na foto para alterar o logo da clínica
      </p>
    </div>
  )
}
