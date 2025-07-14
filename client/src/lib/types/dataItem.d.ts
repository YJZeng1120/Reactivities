interface Name {
  id: string;
  title: string;
}

interface Staff {
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
  users: Staff[];
}
