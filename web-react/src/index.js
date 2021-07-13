import React, { useCallback, useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import registerServiceWorker from './registerServiceWorker'
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client'
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react'

const AppWithApollo = () => {
  const [accessToken, setAccessToken] = useState()
  const { getAccessTokenSilently, loginWithRedirect } = useAuth0()
  const getAccessToken = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently()
      setAccessToken(token)
    } catch (e) {
      if (e.error === 'login_required') {
        console.log('login required')
      }
      if (e.error === 'consent_required') {
        loginWithRedirect()
      }
      if (e.error !== 'login_required') {
        throw e
      }
    }
  }, [getAccessTokenSilently, loginWithRedirect])

  useEffect(() => {
    getAccessToken()
  }, [getAccessToken])
  const headers = accessToken ? `Bearer ${accessToken}` : null
  const client = new ApolloClient({
    uri: process.env.REACT_APP_GRAPHQL_URI,
    cache: new InMemoryCache(),
    headers: {
      Authorization: headers,
    },
  })

  return (
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  )
}

const Main = () => (
  <Auth0Provider
    domain={process.env.REACT_APP_AUTH0_DOMAIN}
    clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
    redirectUri={window.location.origin}
    audience="https://dev-2h0xi70n.us.auth0.com/api/v2/"
  >
    <AppWithApollo />
  </Auth0Provider>
)

ReactDOM.render(<Main />, document.getElementById('root'))
registerServiceWorker()
