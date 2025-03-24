import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Check if the user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get the pathname from the request
  const { pathname } = request.nextUrl

  // If the user is not authenticated and trying to access protected routes, redirect to sign-in
  if (!session) {
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/conductor") ||
      pathname.startsWith("/admin") ||
      pathname === "/onboarding"
    ) {
      const redirectUrl = new URL("/sign-in", request.url)
      return NextResponse.redirect(redirectUrl)
    }
    return res
  }

  // Get the user's role from metadata
  const role = session.user.user_metadata.role

  // Role-based access control
  if (role === "passenger" && (pathname.startsWith("/conductor") || pathname.startsWith("/admin"))) {
    const redirectUrl = new URL("/dashboard", request.url)
    return NextResponse.redirect(redirectUrl)
  }

  if (role === "conductor" && (pathname.startsWith("/dashboard") || pathname.startsWith("/admin"))) {
    const redirectUrl = new URL("/conductor", request.url)
    return NextResponse.redirect(redirectUrl)
  }

  if (role === "admin" && (pathname.startsWith("/dashboard") || pathname.startsWith("/conductor"))) {
    const redirectUrl = new URL("/admin", request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If the user is authenticated and trying to access auth pages, redirect to their dashboard
  if (session && (pathname === "/sign-in" || pathname === "/sign-up")) {
    const redirectUrl = new URL(
      role === "passenger" ? "/dashboard" : role === "conductor" ? "/conductor" : "/admin",
      request.url,
    )
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
}

