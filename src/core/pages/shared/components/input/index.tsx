import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = ({ className, ...props }: InputProps) => {
  const baseStyle =
    'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
  return <input className={`${baseStyle} ${className}`} {...props} />
}

export default Input
