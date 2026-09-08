'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminShell } from '@/components/AdminShell'
import { Plus, Pencil, Trash2, Loader2, X, Check, ImageIcon, Upload } from 'lucide-react'

const CATEGORIES = ['eggs', 'fish', 'chicken', 'rice', 'beans', 'vegetables', 'grains', 'tubers', 'poultry', 'other'] as const
type Category = typeof CATEGORIES[number]

interface Product {
  id: string
  name: string
  category: Category
  unit: string | null
  price: number | null
  is_available: boolean
  image_url: string | null
  created_at: string
}

const EMPTY_FORM = { name: '', category: 'other' as Category, unit: '', price: '', image_url: '', is_available: true }

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { load() }, [])

  async function load() {
    const supabase = createClient()
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    setProducts((data as Product[]) || [])
    setLoading(false)
  }

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setUploadError('')
    setShowForm(true)
  }

  function openEdit(p: Product) {
    setEditing(p)
    setForm({
      name: p.name,
      category: p.category,
      unit: p.unit || '',
      price: p.price?.toString() || '',
      image_url: p.image_url || '',
      is_available: p.is_available,
    })
    setUploadError('')
    setShowForm(true)
  }

  async function handleImageUpload(file: File) {
    if (!file) return
    const MAX = 5 * 1024 * 1024
    if (file.size > MAX) { setUploadError('Image must be under 5MB'); return }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setUploadError('Only JPG, PNG, or WebP allowed')
      return
    }

    setUploading(true)
    setUploadError('')

    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, file, { upsert: false, contentType: file.type })

    if (error) {
      setUploadError('Upload failed — ' + error.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(path)

    setForm(f => ({ ...f, image_url: publicUrl }))
    setUploading(false)
  }

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)
    const supabase = createClient()
    const payload = {
      name: form.name.trim(),
      category: form.category,
      unit: form.unit.trim() || null,
      price: form.price ? parseFloat(form.price) : null,
      image_url: form.image_url.trim() || null,
      is_available: form.is_available,
    }

    if (editing) {
      const { data } = await supabase.from('products').update(payload).eq('id', editing.id).select().single()
      if (data) setProducts(prev => prev.map(p => p.id === editing.id ? data as Product : p))
    } else {
      const { data } = await supabase.from('products').insert(payload).select().single()
      if (data) setProducts(prev => [data as Product, ...prev])
    }
    setSaving(false)
    setShowForm(false)
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    const supabase = createClient()
    await supabase.from('products').delete().eq('id', id)
    setProducts(prev => prev.filter(p => p.id !== id))
    setDeletingId(null)
    setPendingDelete(null)
  }

  async function toggleAvailability(p: Product) {
    const supabase = createClient()
    await supabase.from('products').update({ is_available: !p.is_available }).eq('id', p.id)
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, is_available: !x.is_available } : x))
  }

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-body text-soil text-2xl font-semibold">Products</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-pepper text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl hover:bg-pepper-deep transition-colors"
        >
          <Plus size={15} /> Add product
        </button>
      </div>

      {loading ? (
        <p className="text-soil/50 text-[14px]">Loading...</p>
      ) : products.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-soil/10 rounded-2xl">
          <p className="text-soil/40 text-[14px] mb-3">No products yet</p>
          <button onClick={openCreate} className="text-pepper font-semibold text-[14px] hover:underline">
            Add your first product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-soil/8 overflow-hidden">
              <div className="aspect-[3/2] bg-grain-dim overflow-hidden relative">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={28} className="text-soil/20" />
                  </div>
                )}
                <button
                  onClick={() => toggleAvailability(p)}
                  className={`absolute top-2 right-2 text-[11px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                    p.is_available ? 'bg-okra/15 text-okra' : 'bg-stone/15 text-stone'
                  }`}
                >
                  {p.is_available ? 'In stock' : 'Out of stock'}
                </button>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-body text-soil font-bold text-[15px] leading-tight">{p.name}</p>
                  <span className="shrink-0 text-[10px] font-medium text-stone/50 bg-grain-dim px-2 py-0.5 rounded-full capitalize">{p.category}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div>
                    {p.price && <p className="text-pepper font-bold text-[14px]">₦{p.price.toLocaleString('en-NG')}</p>}
                    {p.unit && <p className="text-soil/50 text-[12px]">{p.unit}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(p)}
                      className="p-1.5 text-soil/40 hover:text-soil hover:bg-grain-dim rounded-lg transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    {pendingDelete === p.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id)}
                          disabled={deletingId === p.id}
                          className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-pepper text-white hover:bg-pepper-deep"
                        >
                          {deletingId === p.id ? '…' : 'Delete'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(null)}
                          className="text-[11px] px-2 py-1 rounded-lg text-soil/50 hover:bg-grain-dim"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPendingDelete(p.id)}
                        className="p-1.5 text-soil/40 hover:text-pepper hover:bg-pepper/5 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Form modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
          <div className="absolute inset-0 bg-soil/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">

            <div className="flex items-center justify-between px-5 py-4 border-b border-soil/8">
              <h2 className="font-body text-soil text-[17px] font-semibold">
                {editing ? 'Edit product' : 'Add product'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1 text-soil/40 hover:text-soil transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="px-5 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

              {/* Name */}
              <div>
                <label className="block text-[12px] font-semibold text-soil/60 mb-1.5">Product name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Catfish, Fresh Tomatoes"
                  className="w-full text-[14px] text-soil border border-soil/15 rounded-xl px-3.5 py-2.5 outline-none focus:border-pepper transition-colors"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[12px] font-semibold text-soil/60 mb-1.5">Category *</label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, category: c as Category }))}
                      className={`text-[12px] capitalize px-3 py-1.5 rounded-full border transition-colors ${
                        form.category === c
                          ? 'bg-pepper text-white border-pepper'
                          : 'bg-white text-soil/70 border-soil/15 hover:border-pepper/40'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price & Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-soil/60 mb-1.5">Price (₦)</label>
                  <input
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="e.g. 2500"
                    type="number"
                    className="w-full text-[14px] text-soil border border-soil/15 rounded-xl px-3.5 py-2.5 outline-none focus:border-pepper transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-soil/60 mb-1.5">Unit</label>
                  <input
                    value={form.unit}
                    onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                    placeholder="per kg, per crate"
                    className="w-full text-[14px] text-soil border border-soil/15 rounded-xl px-3.5 py-2.5 outline-none focus:border-pepper transition-colors"
                  />
                </div>
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-[12px] font-semibold text-soil/60 mb-1.5">Product image</label>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file)
                    e.target.value = ''
                  }}
                />

                {form.image_url ? (
                  /* Preview with replace/remove controls */
                  <div className="relative rounded-xl overflow-hidden border border-soil/10">
                    <div className="aspect-[3/2]">
                      <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute inset-0 bg-soil/0 hover:bg-soil/40 transition-colors group flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 bg-white text-soil text-[12px] font-semibold px-3 py-2 rounded-lg shadow"
                      >
                        <Upload size={13} />
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, image_url: '' }))}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 bg-white text-pepper text-[12px] font-semibold px-3 py-2 rounded-lg shadow"
                      >
                        <X size={13} />
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Upload dropzone */
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full border-2 border-dashed border-soil/15 rounded-xl py-8 flex flex-col items-center gap-2 hover:border-pepper/40 hover:bg-pepper/3 transition-all disabled:opacity-60"
                  >
                    {uploading ? (
                      <Loader2 size={22} className="text-pepper animate-spin" />
                    ) : (
                      <Upload size={22} className="text-soil/30" />
                    )}
                    <span className="text-[13px] text-soil/50 font-medium">
                      {uploading ? 'Uploading…' : 'Click to upload image'}
                    </span>
                    <span className="text-[11px] text-soil/30">JPG, PNG or WebP · max 5MB</span>
                  </button>
                )}

                {uploadError && (
                  <p className="text-[12px] text-red-500 mt-1.5">{uploadError}</p>
                )}
              </div>

              {/* Availability */}
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-[14px] font-semibold text-soil">In stock</p>
                  <p className="text-[12px] text-soil/50">Show this product in the store</p>
                </div>
                <button
                  onClick={() => setForm(f => ({ ...f, is_available: !f.is_available }))}
                  className={`w-11 h-6 rounded-full transition-colors relative ${form.is_available ? 'bg-pepper' : 'bg-soil/15'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.is_available ? 'left-5.5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-soil/8">
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim() || uploading}
                className="w-full flex items-center justify-center gap-2 bg-pepper text-white font-semibold text-[15px] py-3.5 rounded-2xl hover:bg-pepper-deep transition-colors disabled:opacity-60"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Add product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  )
}
