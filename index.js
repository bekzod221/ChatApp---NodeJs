import express from "express"
import { readPath, writePath } from "./utils/hooks.js"
import cors from "cors"

const app = express()
app.use(express.json())
app.use(cors())

app.get('/', async (req, res) => {
    let chat = JSON.parse(await readPath('messages'))
    res.json(chat)
})

app.get('/users', async (req, res) => {
    let users = JSON.parse(await readPath('users'))
    res.json(users)
})

app.post('/auth/', async (req, res) => {
    try {
        let users = JSON.parse(await readPath('users'))
        let inputVal = req.body
        let found = users.find(user => 
            user.password.toLowerCase() === inputVal.password.toLowerCase() && 
            user.name.toLowerCase() === inputVal.name.toLowerCase()
        )
        
        if(found){
            console.log('User authenticated:', found.name)
            res.json({ success: true, user: found })
        } else {
            console.log('Authentication failed for:', inputVal.name)
            res.status(401).json({ success: false, message: 'Invalid credentials' })
        }
    } catch (error) {
        console.error('Auth error:', error)
        res.status(500).json({ success: false, message: 'Server error' })
    }
})

app.post('/register/', async (req, res) => {
    try {
        let users = JSON.parse(await readPath('users'))
        let { name, password } = req.body
        
        let existingUser = users.find(user => 
            user.name.toLowerCase() === name.toLowerCase()
        )
        
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'User already exists' 
            })
        }
        
        const newUser = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            name: name,
            password: password
        }
        
        users.push(newUser)
        await writePath('users', JSON.stringify(users, null, 4))
        
        console.log('New user registered:', newUser.name)
        res.status(201).json({ 
            success: true, 
            user: { id: newUser.id, name: newUser.name } 
        })
    } catch (error) {
        console.error('Registration error:', error)
        res.status(500).json({ success: false, message: 'Server error' })
    }
})

app.post('/create/:id', async (req, res) => {
    try {
        let users = JSON.parse(await readPath('users'))
        let chat = JSON.parse(await readPath('messages'))
        const id = parseInt(req.params.id)
        const found = users.find((user) => user.id === id)
        
        console.log(`Post working, id is: ${id}`)
        
        if(found){
            let date = new Date()
            let newMsg = req.body.message
            
            if (!newMsg || newMsg.trim() === '') {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Message cannot be empty' 
                })
            }
            
            let messageObj = {
                id: found.id,
                name: found.name,
                message: newMsg.trim(),
                msg_id: date.getTime(),
                timestamp: date.toISOString()
            }
            
            chat.push(messageObj)
            await writePath('messages', JSON.stringify(chat, null, 4))
            
            console.log(`Message sent by ${found.name}: ${newMsg}`)
            res.status(201).json({ 
                success: true, 
                message: 'Message sent successfully',
                data: messageObj
            })
        } else {
            res.status(400).json({ 
                success: false, 
                message: 'User not found' 
            })
        }
    } catch (error) {
        console.error('Message creation error:', error)
        res.status(500).json({ success: false, message: 'Server error' })
    }
})

const PORT = 4000
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))