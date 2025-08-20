"use client"

import type React from "react"

import { useState } from "react"

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    let valid = true
    const newErrors = { ...errors }

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório"
      valid = false
    }

    if (!formData.email.trim()) {
      newErrors.email = "E-mail é obrigatório"
      valid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "E-mail inválido"
      valid = false
    }

    if (formData.phone && !/^$$\d{2}$$ \d{4,5}-\d{4}$/.test(formData.phone)) {
      newErrors.phone = "Telefone inválido. Use o formato (99) 99999-9999"
      valid = false
    }

    if (!formData.message.trim()) {
      newErrors.message = "Mensagem é obrigatória"
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      setIsSubmitting(true)

      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false)
        setSubmitSuccess(true)
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        })

        // Reset success message after 5 seconds
        setTimeout(() => {
          setSubmitSuccess(false)
        }, 5000)
      }, 1500)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {submitSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 dark:bg-green-900 dark:border-green-700 dark:text-green-300 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">Mensagem enviada com sucesso! Entraremos em contato em breve.</span>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
          Nome Completo <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full border ${errors.name ? "border-red-500" : "border-gray-300 dark:border-gray-600"} rounded-lg py-2 px-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cliente focus:border-transparent`}
          placeholder="Seu nome completo"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
          E-mail <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full border ${errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"} rounded-lg py-2 px-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cliente focus:border-transparent`}
          placeholder="seu.email@exemplo.com"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
          Telefone
        </label>
        <input
          type="text"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={`w-full border ${errors.phone ? "border-red-500" : "border-gray-300 dark:border-gray-600"} rounded-lg py-2 px-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cliente focus:border-transparent`}
          placeholder="(99) 99999-9999"
        />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
      </div>

      <div>
        <label htmlFor="subject" className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
          Assunto
        </label>
        <select
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cliente focus:border-transparent"
        >
          <option value="">Selecione um assunto</option>
          <option value="Dúvida sobre produtos">Dúvida sobre produtos</option>
          <option value="Orçamento">Orçamento</option>
          <option value="Suporte técnico">Suporte técnico</option>
          <option value="Reclamação">Reclamação</option>
          <option value="Outros">Outros</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
          Mensagem <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={5}
          className={`w-full border ${errors.message ? "border-red-500" : "border-gray-300 dark:border-gray-600"} rounded-lg py-2 px-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cliente focus:border-transparent`}
          placeholder="Digite sua mensagem aqui..."
        ></textarea>
        {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full bg-cliente hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
        </button>
      </div>
    </form>
  )
}
