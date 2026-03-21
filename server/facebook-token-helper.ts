/**
 * Helper functions for Facebook token validation and page info retrieval
 */

export interface FacebookPageInfo {
  id: string;
  name: string;
  picture?: string;
  category?: string;
}

export interface TokenValidationResult {
  isValid: boolean;
  error?: string;
  pageInfo?: FacebookPageInfo;
}

/**
 * Validate a Facebook page access token and retrieve page information
 * @param pageAccessToken The page access token to validate
 * @returns Validation result with page info if valid
 */
export async function validateFacebookToken(pageAccessToken: string): Promise<TokenValidationResult> {
  try {
    // Validate token by calling Facebook Graph API
    const response = await fetch('https://graph.facebook.com/v18.0/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${pageAccessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Facebook Token Validation] Error:', errorData);
      
      if (response.status === 400) {
        return {
          isValid: false,
          error: 'Invalid or expired token',
        };
      }
      
      if (response.status === 401) {
        return {
          isValid: false,
          error: 'Unauthorized - token may be expired or revoked',
        };
      }

      return {
        isValid: false,
        error: `Facebook API error: ${errorData.error?.message || 'Unknown error'}`,
      };
    }

    const data = await response.json();

    // Verify this is a page token (should have 'id' and 'name')
    if (!data.id || !data.name) {
      return {
        isValid: false,
        error: 'Token does not appear to be a valid page access token',
      };
    }

    return {
      isValid: true,
      pageInfo: {
        id: data.id,
        name: data.name,
        picture: data.picture?.data?.url,
        category: data.category,
      },
    };
  } catch (error) {
    console.error('[Facebook Token Validation] Exception:', error);
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown validation error',
    };
  }
}

/**
 * Get all pages accessible with a given access token
 * @param accessToken The access token (user or app token)
 * @returns List of pages the token has access to
 */
export async function getAccessiblePages(accessToken: string): Promise<FacebookPageInfo[]> {
  try {
    const response = await fetch('https://graph.facebook.com/v18.0/me/accounts', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error('[Get Accessible Pages] Error:', response.status);
      return [];
    }

    const data = await response.json();
    return (data.data || []).map((page: any) => ({
      id: page.id,
      name: page.name,
      picture: page.picture?.data?.url,
      category: page.category,
    }));
  } catch (error) {
    console.error('[Get Accessible Pages] Exception:', error);
    return [];
  }
}
