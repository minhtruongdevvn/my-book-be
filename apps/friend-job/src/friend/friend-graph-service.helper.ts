import { Friend, Person } from '@app/microservices/friend';

export const defaultFilter = (
  filter?: Friend.Payload.QueryFilter,
  defaultQuery?: Friend.Payload.QueryFilter,
): Required<Friend.Payload.QueryFilter> => {
  const defaultSkip = 0;
  const defaultTake = 20;

  return {
    skip: filter?.skip ?? defaultQuery?.skip ?? defaultSkip,
    take: filter?.take ?? defaultQuery?.take ?? defaultTake,
    search: filter?.search ?? defaultQuery?.search ?? '',
  };
};

export const includeName = (person: Person, search: string) => {
  search = search.toLowerCase();
  return (
    person.alias.toLowerCase().includes(search) ||
    (person.firstName ?? '').toLowerCase().includes(search) ||
    (person.lastName ?? '').toLowerCase().includes(search) ||
    `${person.firstName ?? ''} ${person.lastName ?? ''}`
      .toLowerCase()
      .includes(search)
  );
};
