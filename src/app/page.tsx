'use client'

import React, { useState, useCallback } from 'react'
import { getDESCipherText, getDESPlainText } from '../utils/des'
import { hashMergeKeys } from '../utils/hashcode'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Upload, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion, AnimatePresence } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type UserData = {
  isEncrypting: boolean
  inputType: 'text' | 'file'
  input: string
  key: string
  result: string
  file: File | null
  mergedKey: string
}

export default function App() {
  const [userData, setUserData] = useState<{ [key: string]: UserData }>({
    a: { isEncrypting: true, inputType: 'text', input: '', key: '', result: '', file: null, mergedKey: '' },
    b: { isEncrypting: true, inputType: 'text', input: '', key: '', result: '', file: null, mergedKey: '' },
  })
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, user: string) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === "text/plain") {
      setUserData(prev => ({
        ...prev,
        [user]: { ...prev[user], file: droppedFile }
      }))
      const reader = new FileReader()
      reader.onload = (e) => setUserData(prev => ({
        ...prev,
        [user]: { ...prev[user], input: e.target?.result as string }
      }))
      reader.readAsText(droppedFile)
    } else {
      setError('Only .txt files can be uploaded!')
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, user: string) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "text/plain") {
      setUserData(prev => ({
        ...prev,
        [user]: { ...prev[user], file: selectedFile }
      }))
      const reader = new FileReader()
      reader.onload = (e) => setUserData(prev => ({
        ...prev,
        [user]: { ...prev[user], input: e.target?.result as string }
      }))
      reader.readAsText(selectedFile)
    } else {
      setError('Only .txt files can be uploaded!')
    }
  }

  const handleConvert = (user: string) => {
    setError('')
    const { input, mergedKey, isEncrypting } = userData[user]
    if (!mergedKey || mergedKey.length > 32) {
      setError('The key cannot be empty and cannot be longer than 32.')
      return
    }

    try {
      const result = isEncrypting ? getDESCipherText(input, mergedKey) : getDESPlainText(input, mergedKey)
      setUserData(prev => ({
        ...prev,
        [user]: { ...prev[user], result }
      }))
    } catch (err) {
      setError('An error occurred during processing. Please check your input')
    }
  }

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>, user: string) => {
    const newKey = e.target.value
    setUserData(prev => ({
      ...prev,
      [user]: { ...prev[user], key: newKey }
    }))
  }

  const handleMergeKeys = (userA: string, userB: string) => {
    // 检查a和b的key是否为空
    if (!userData[userA].key || !userData[userB].key) {
      setError('Both users must enter a key to merge.')
      return
    }

    const mergedKey = hashMergeKeys(userData[userA].key, userData[userB].key);

    setUserData(prev => ({
      ...prev,
      [userA]: { ...prev[userA], mergedKey },
      [userB]: { ...prev[userB], mergedKey }
    }));

    console.log(`Merged Key for User ${userA.toUpperCase()}: ${mergedKey}`);
    console.log(`Merged Key for User ${userB.toUpperCase()}: ${mergedKey}`);
  }



  const renderUserInterface = (user: string) => (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center">DES Tool - User {user.toUpperCase()}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <motion.div
          className="flex items-center justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center space-x-4">
            <span className={`text-sm ${!userData[user].isEncrypting ? 'font-bold' : ''}`}>Decrypt</span>
            <Switch
              id={`mode-switch-${user}`}
              checked={userData[user].isEncrypting}
              onCheckedChange={(checked) => setUserData(prev => ({
                ...prev,
                [user]: { ...prev[user], isEncrypting: checked }
              }))}
            />
            <span className={`text-sm ${userData[user].isEncrypting ? 'font-bold' : ''}`}>Encrypt</span>
          </div>
        </motion.div>

        <motion.div
          className="space-y-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Label htmlFor={`key-${user}`}>KEY</Label>
          <div className="flex space-x-2">
            <Input
              id={`key-${user}`}
              value={userData[user].key}
              onChange={(e) => handleKeyChange(e, user)}
              placeholder="Key (no more than 32 bits)"
            />
            {/* 在 'a' 界面调用 'handleMergeKeys' 并指定 'a' 和 'b' */}
            <Button onClick={() => handleMergeKeys('a', 'b')}>Merge Keys</Button>
          </div>
        </motion.div>

        <motion.div
          className="space-y-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Label htmlFor={`merged-key-${user}`}>Merged Key</Label>
          <Input
            id={`merged-key-${user}`}
            value={userData[user].mergedKey}
            readOnly
            placeholder="Merged key will appear here"
          />
        </motion.div>

        <motion.div
          className="space-y-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Label htmlFor={`input-type-${user}`}>Input Mode</Label>
          <Select
            onValueChange={(value: 'text' | 'file') => setUserData(prev => ({
              ...prev,
              [user]: { ...prev[user], inputType: value }
            }))}
            value={userData[user].inputType}
          >
            <SelectTrigger>
              <SelectValue>{userData[user].inputType === 'text' ? 'Text Input' : 'File Upload'}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text Input</SelectItem>
              <SelectItem value="file">File Upload</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        <AnimatePresence mode="wait">
          {userData[user].inputType === 'text' ? (
            <motion.div
              key="text-input"
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Label htmlFor={`input-${user}`}>Input</Label>
              <textarea
                value={userData[user].input}
                onChange={(e) => setUserData(prev => ({
                  ...prev,
                  [user]: { ...prev[user], input: e.target.value }
                }))}
                placeholder={userData[user].isEncrypting ? "Plaintext" : "Ciphertext"}
                className="w-full h-32 p-2 border rounded-md"
              />
            </motion.div>
          ) : (
            <motion.div
              key="file-input"
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Label>File Upload</Label>
              <div
                className={`border-2 border-dashed rounded-md p-4 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, user)}
              >
                {userData[user].file ? (
                  <div className="flex items-center justify-between">
                    <span>{userData[user].file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUserData(prev => ({
                        ...prev,
                        [user]: { ...prev[user], file: null, input: '' }
                      }))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p>Drag and drop files here or</p>
                    <label htmlFor={`file-upload-${user}`} className="cursor-pointer text-blue-500 hover:text-blue-600">
                      click to upload
                    </label>
                    <input
                      id={`file-upload-${user}`}
                      type="file"
                      className="hidden"
                      accept=".txt"
                      onChange={(e) => handleFileChange(e, user)}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button onClick={() => handleConvert(user)} className="w-full">
            {userData[user].isEncrypting ? 'Encrypt' : 'Decrypt'}
          </Button>
        </motion.div>

        <motion.div
          className="space-y-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Label htmlFor={`result-${user}`}>Result</Label>
          <textarea
            id={`result-${user}`}
            value={userData[user].result}
            readOnly
            placeholder={userData[user].isEncrypting ? "Ciphertext" : "Plaintext"}
            className="w-full h-32 p-2 border rounded-md"
          />
        </motion.div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 flex flex-col items-center justify-center p-4 space-y-8">
      <div className="flex flex-col md:flex-row gap-8 w-full justify-center">
        {renderUserInterface('a')}
        {renderUserInterface('b')}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}