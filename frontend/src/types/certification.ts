export interface CertificationUnit {
  id: string;
  module_id?: string;
  title: string;
  content: string;
  video_url: string;
  order_index: number;
}

export interface CertificationModule {
  id: string;
  certification_id?: string;
  title: string;
  order_index: number;
  units: CertificationUnit[];
}

export interface Certification {
  id: string;
  title: string;
  description: string;
  overview: string;
  image_url: string;
  price: number;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
  modules?: CertificationModule[];
}
