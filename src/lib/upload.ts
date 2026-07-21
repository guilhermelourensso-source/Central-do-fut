import { supabase } from '@/lib/supabase'

export async function uploadTeamAsset(file: File, folder: string): Promise<{ url: string | null; error: string | null }> {
  const ext = file.name.split('.').pop()
  const path = `${folder}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage.from('team-assets').upload(path, file, {
    cacheControl: '3600',
    upsert: false
  })

  if (error) return { url: null, error: error.message }

  const { data } = supabase.storage.from('team-assets').getPublicUrl(path)
  return { url: data.publicUrl, error: null }
}
