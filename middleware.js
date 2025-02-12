import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(req) {
  const token = req.cookies.get('token');
  const url = req.nextUrl.clone();

  if (!token) {
    url.pathname = '/welcome-page';
    return NextResponse.redirect(url);
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return NextResponse.next();
  } catch (error) {
    url.pathname = '/welcome-page';
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ['/home-page', '/edit-profile'],
};
