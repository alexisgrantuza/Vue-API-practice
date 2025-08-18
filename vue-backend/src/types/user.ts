export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone?: string | null;
  website?: string | null;
  address?: Address | null;
  company?: Company | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: number;
  street: string;
  suite?: string | null;
  city: string;
  zipcode?: string | null;
  geo?: Geo | null;
  userId: number;
}

export interface Geo {
  id: number;
  lat: string;
  lng: string;
  addressId: number;
}

export interface Company {
  id: number;
  name: string;
  catchPhrase?: string | null;
  bs?: string | null;
  userId: number;
}

export interface CreateUserData {
  name: string;
  username: string;
  email: string;
  phone?: string;
  website?: string;
  address?: {
    street: string;
    suite?: string;
    city: string;
    zipcode?: string;
    geo?: {
      lat: string;
      lng: string;
    };
  };
  company?: {
    name: string;
    catchPhrase?: string;
    bs?: string;
  };
}

export interface UpdateUserData extends Partial<CreateUserData> {
  id: number;
}

export interface UserQuery {
  search?: string;
  page?: number;
  limit?: number;
}

export interface JsonPlaceholderUser {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}
