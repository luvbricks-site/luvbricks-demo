declare module "zipcodes" {
  type ZipInfo = {
    zip: string;
    city: string;
    state: string;
    latitude?: number | string;
    longitude?: number | string;
    population?: number | string;
    timezone?: string | number;
  };

  const zipcodes: {
    lookup(zip: string | number): ZipInfo | null;
  };

  export default zipcodes;
}
