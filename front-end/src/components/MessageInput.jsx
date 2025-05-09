import React, { useRef, useState } from 'react'
import { useChatStore } from '../store/useChatStore'
import { Image, Send, X } from 'lucide-react'
import toast from 'react-hot-toast'

const MessageInput = () => {

  const [text,setText] = useState('')
  const [imagePreview,setImagePreview] = useState(null)
  const fileInputRef = useRef(null)
  const {sendMessages} = useChatStore()

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if(!file.type.startsWith('image/')){
      toast.error('Please select an image file')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImagePreview(null)
    if(fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSendMessages = async(e) => {
    e.preventDefault()
    if(!text.trim() && !imagePreview) return
    try {
      await sendMessages({
        text: text.trim(),
        image: imagePreview,
      })

      setText('')
      setImagePreview(null)
      if(fileInputRef.current) fileInputRef.current.value = ''
    } catch (error) {
      console.error('Failed to send messages',error)
    }
  }

  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessages} className="flex items-end gap-2 w-full">
  {/* Text input - takes remaining space */}
  <div className="flex-1">
    <input
      type="text"
      className="w-full input input-bordered rounded-lg"
      placeholder="Type a message..."
      value={text}
      onChange={(e) => setText(e.target.value)}
    />
  </div>

  {/* Action buttons container - aligns with input */}
  <div className="flex gap-2 items-center h-full">
    {/* Image upload button */}
    <button
      type="button"
      className="btn btn-ghost btn-square p-2"
      onClick={() => fileInputRef.current?.click()}
    >
      <Image size={24} className={imagePreview ? "text-emerald-600" : "text-zinc-400"} />
    </button>
    
    {/* Hidden file input */}
    <input
      type="file"
      accept="image/*"
      className="hidden"
      ref={fileInputRef}
      onChange={handleImageChange}
    />

    {/* Send button */}
    <button
      type="submit"
      className="btn btn-primary btn-square p-2"
      disabled={!text.trim() && !imagePreview}
    >
      <Send size={24} />
    </button>
  </div>
</form>
    </div>
  );
}

export default MessageInput
