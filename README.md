[![GitHub issues](https://img.shields.io/github/issues/dazejs/graphql-provider.svg)](https://github.com/dazejs/graphql-provider/issues)
[![npm](https://img.shields.io/npm/v/@dazejs/graphql-provider.svg)](https://www.npmjs.com/package/@dazejs/graphql-provider)
[![npm](https://img.shields.io/npm/dm/@dazejs/graphql-provider.svg)](https://www.npmjs.com/package/@dazejs/graphql-provider)
[![GitHub license](https://img.shields.io/github/license/dazejs/graphql-provider.svg)](https://github.com/dazejs/graphql-provider/blob/master/LICENSE)

<div align="center">
  <a href="https://github.com/dazejs/graphql-provider">
    <img width="600" heigth="300" src="https://github.com/dazejs/graphql-provider/blob/master/assets/logo.png">
  </a>  
  <h2>GraphQL</h2>
  <h4>基于 Daze.js 的 GraphQL 扩展</h4>
</div>

## 简介

这是一套基于 Daze.js 的 GraphQL 的扩展。

## 开始

### 安装

```bash
$ npm install --save @dazejs/graphql-provider
```

### 加载GraphQL服务提供者

添加 `GraphQLProvider` 到 `config/app.ts` 配置中

```ts
import { GraphQLProvider } from '@dazejs/graphql-provider';

export default {
  // ...
  providers: [
    // ...
    GraphQLProvider
  ]
  // ...
}
```

## 使用

### 定义 graphql 描述文件

你可以在 `config` 目录中定义多个 `*.graphql` 的描述文件，比如：

* config/graphql/hello.graphql

```graphql
type Query {
    hello(str: String): String!
}
```

### 定义对应的处理类

* hello.graphql.ts

```typescript
import { graphQL, query } from '@dazejs/graphql-provider';

@graphQL()
export default class HelloGraphql {

  @query()
  hello({ str }: any) {
    return `Hello ${str}`;
  }
}
```

## 更多功能

* 内置 [graphql-scalars](https://github.com/Urigo/graphql-scalars)
* 更详细的实例参考 `__test__` 目录
