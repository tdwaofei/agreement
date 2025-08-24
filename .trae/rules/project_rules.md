# 项目开发规范

> 基于合同管理系统开发过程中遇到的问题总结的最佳实践

## 📋 目录

- [API封装层设计规范](#api封装层设计规范)
- [前端数据处理标准](#前端数据处理标准)
- [TypeScript类型定义要求](#typescript类型定义要求)
- [调试和错误处理最佳实践](#调试和错误处理最佳实践)
- [代码审查检查点](#代码审查检查点)
- [新项目初始化清单](#新项目初始化清单)

---

## 🔧 API封装层设计规范

### 1. 统一响应格式

**问题：** API方法返回格式不一致，导致前端数据处理错误

**解决方案：**
```typescript
// ✅ 正确：统一在API封装层处理响应
export const get = <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return api.get(url, config).then(response => response.data)
}

// ❌ 错误：让调用方处理不同的响应格式
export const get = (url: string) => api.get(url) // 返回完整Axios响应
```

### 2. 响应数据标准化

**创建响应处理工具类：**
```typescript
// utils/apiUtils.ts
export class ApiResponseHandler {
  static extractData<T>(response: any): T {
    if (response && typeof response === 'object' && 'data' in response) {
      return response.data
    }
    return response
  }

  static extractPageData<T>(response: any): PageResponse<T> {
    const data = this.extractData(response)
    return {
      content: data?.content || [],
      totalElements: data?.totalElements || 0,
      // ... 其他分页字段
    }
  }
}
```

### 3. API方法命名规范

- **获取列表：** `getXxxList()` 或 `getXxxs()`
- **获取详情：** `getXxxById(id)`
- **创建：** `createXxx(data)`
- **更新：** `updateXxx(id, data)`
- **删除：** `deleteXxx(id)`

---

## 📊 前端数据处理标准

### 1. 状态初始化

```typescript
// ✅ 正确：明确初始化数据类型
const [users, setUsers] = useState<User[]>([])
const [contracts, setContracts] = useState<Contract[]>([])
const [loading, setLoading] = useState<boolean>(false)

// ❌ 错误：未明确初始化类型
const [users, setUsers] = useState()
```

### 2. API调用模式

```typescript
// ✅ 正确：标准API调用模式
const loadData = async () => {
  try {
    setLoading(true)
    setError(null)
    
    const data = await apiService.getData()
    setData(data)
  } catch (error) {
    console.error('加载数据失败:', error)
    setError('加载失败')
    setData([]) // 确保状态类型一致
  } finally {
    setLoading(false)
  }
}
```

### 3. 数据验证

```typescript
// ✅ 正确：运行时数据验证
const validateArrayData = <T>(data: any, fallback: T[] = []): T[] => {
  if (!Array.isArray(data)) {
    console.warn('Expected array, got:', typeof data)
    return fallback
  }
  return data
}

// 使用示例
setUsers(validateArrayData(response.data, []))
```

---

## 🏷️ TypeScript类型定义要求

### 1. 接口定义规范

```typescript
// ✅ 正确：完整的接口定义
export interface User {
  id: number
  username: string
  realName: string
  email: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}
```

### 2. API响应类型

```typescript
// ✅ 正确：明确API返回类型
export const contractApi = {
  getContracts: (params: ContractQueryParams): Promise<PageResponse<Contract>> => {
    return api.get<PageResponse<Contract>>('/contracts', { params })
  },
  
  getUsers: (): Promise<User[]> => {
    return api.get<User[]>('/contracts/users')
  }
}
```

### 3. 严格模式配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitReturns": true
  }
}
```

---

## 🐛 调试和错误处理最佳实践

### 1. 分层调试策略

```typescript
// 开发环境调试工具
export class DebugUtils {
  private static isDev = import.meta.env.DEV

  static logApiCall(method: string, url: string, params?: any, response?: any) {
    if (!this.isDev) return
    
    console.group(`[API ${method}] ${url}`)
    if (params) console.log('请求参数:', params)
    if (response) console.log('响应数据:', response)
    console.groupEnd()
  }

  static logDataProcessing(step: string, data: any) {
    if (!this.isDev) return
    console.log(`[数据处理] ${step}:`, data)
  }
}
```

### 2. 错误边界处理

```typescript
// 组件级错误边界
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('组件错误:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />
    }
    return this.props.children
  }
}
```

### 3. 调试日志规范

```typescript
// ✅ 正确：结构化调试日志
console.log('=== API调用开始 ===')
console.log('请求参数:', params)
console.log('响应数据类型:', typeof response)
console.log('响应数据结构:', Object.keys(response))
console.log('=== API调用结束 ===')

// ❌ 错误：无结构的日志
console.log(response)
```

---

## ✅ 代码审查检查点

### 1. API相关检查

- [ ] API方法是否有明确的返回类型声明？
- [ ] 是否统一处理了Axios响应格式？
- [ ] 错误处理是否完整？
- [ ] 是否有适当的loading状态管理？

### 2. 数据处理检查

- [ ] 状态初始化是否有明确类型？
- [ ] 是否有运行时数据验证？
- [ ] 数组操作前是否检查了数据类型？
- [ ] 异常情况下是否有合理的fallback？

### 3. TypeScript检查

- [ ] 是否启用了严格模式？
- [ ] 接口定义是否完整？
- [ ] 是否有any类型的滥用？
- [ ] 可选属性是否正确标记？

### 4. 用户体验检查

- [ ] 是否有loading状态提示？
- [ ] 错误信息是否用户友好？
- [ ] 是否有重试机制？
- [ ] 空状态是否有合理展示？

---

## 🚀 新项目初始化清单

### 1. 项目结构设置

```
project/
├── src/
│   ├── services/          # API服务层
│   │   ├── api.ts         # 基础API配置
│   │   └── xxxApi.ts      # 具体业务API
│   ├── utils/             # 工具函数
│   │   ├── apiUtils.ts    # API响应处理工具
│   │   └── debugUtils.ts  # 调试工具
│   ├── types/             # 类型定义
│   │   └── api.ts         # API相关类型
│   └── components/        # 组件
│       └── ErrorBoundary/ # 错误边界组件
└── .trae/
    └── rules/
        └── project_rules.md
```

### 2. 基础配置文件

**tsconfig.json 严格模式：**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

**API基础配置：**
```typescript
// src/services/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 统一响应处理
api.interceptors.response.use(
  response => response.data,
  error => Promise.reject(error)
)

export default api
```

### 3. 开发工具设置

- [ ] 配置ESLint规则
- [ ] 设置Prettier格式化
- [ ] 启用TypeScript严格模式
- [ ] 配置调试工具
- [ ] 设置错误边界组件

### 4. 团队协作规范

- [ ] 建立代码审查流程
- [ ] 制定API设计规范
- [ ] 统一错误处理模式
- [ ] 建立调试日志规范

---

## 📝 常见问题解决方案

### 问题1：API返回数据格式不一致

**症状：** 有时返回直接数据，有时返回Axios响应对象

**解决：**
```typescript
// 创建统一的响应处理函数
const handleApiResponse = <T>(response: any): T => {
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data
  }
  return response
}
```

### 问题2：组件渲染时数据类型错误

**症状：** `xxx.map is not a function`

**解决：**
```typescript
// 确保状态初始化为正确类型
const [items, setItems] = useState<Item[]>([])

// 渲染时进行类型检查
{Array.isArray(items) && items.map(item => (
  <div key={item.id}>{item.name}</div>
))}
```

### 问题3：页面刷新后数据不更新

**症状：** 从其他页面返回时数据未刷新

**解决：**
```typescript
// 添加页面可见性监听
useEffect(() => {
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      loadData()
    }
  }
  
  document.addEventListener('visibilitychange', handleVisibilityChange)
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
}, [])
```

---

## 🎯 总结

遵循这些规范可以有效避免：

1. **API响应处理错误** - 统一的响应格式处理
2. **数据类型不匹配** - 严格的TypeScript类型检查
3. **调试困难** - 结构化的调试日志
4. **用户体验问题** - 完善的错误处理和状态管理
5. **代码维护困难** - 清晰的代码结构和规范

**记住：预防胜于治疗，规范的建立是为了避免问题的发生，而不是事后补救。**

---

*最后更新：2025年8月*
*版本：v1.0*