interface Name {
  id: string;
  title: string;
}

interface User {
  name: Name;
  department: string;
  email: string;
  extension: string;
  isAdmin: boolean;
}

interface Role {
  id: string;
  title: string;
}

interface DataItem {
  role: Role;
  users: User[];
}
